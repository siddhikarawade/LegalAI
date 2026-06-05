import os
import time
import uuid
import tempfile
import fitz
from supabase import create_client
from dotenv import load_dotenv

# load env variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "case-docs")

# create client
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

def get_unprocessed_documents():
    response = supabase.table("documents") \
        .select("*") \
        .eq("extracting_images", True) \
        .eq("images_extracted", False) \
        .execute()
    return response.data


def download_pdf(file_url: str):
    path = file_url.split(
        f"/storage/v1/object/public/{SUPABASE_BUCKET}/"
    )[1]
    tmp = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )
    file_bytes = supabase.storage.from_(
        SUPABASE_BUCKET
    ).download(path)
    tmp.write(file_bytes)
    tmp.close()
    return tmp.name


def upload_image(local_path: str, doc_id: str, file_name: str):
    storage_path = f"extracted/{doc_id}/{file_name}"
    with open(local_path, "rb") as f:
        supabase.storage.from_(
            SUPABASE_BUCKET
        ).upload(
            storage_path,
            f,
            {"content-type": "image/png"}
        )
    url = supabase.storage.from_(
        SUPABASE_BUCKET
    ).get_public_url(storage_path)
    return url


def save_image_record(doc_id: str, url: str):
    supabase.table("extracted_images") \
        .insert({
            "id": str(uuid.uuid4()),
            "document_id": doc_id,
            "image_url": url
        }) \
        .execute()


def mark_document_done(doc_id: str):
    supabase.table("documents") \
        .update({
            "images_extracted": True,
            "extracting_images":False
        }) \
        .eq("id", doc_id) \
        .execute()


def extract_images_from_pdf(doc: dict):

    pdf_path = download_pdf(
        doc["file_url"]
    )

    pdf = fitz.open(pdf_path)

    with tempfile.TemporaryDirectory() as temp_dir:

        for page_index in range(len(pdf)):

            page = pdf[page_index]

            # render whole page
            pix = page.get_pixmap(dpi=200)

            file_name = (
                f"page_{page_index+1}.png"
            )

            local_path = os.path.join(
                temp_dir,
                file_name
            )

            pix.save(local_path)

            url = upload_image(
                local_path,
                doc["id"],
                file_name
            )

            save_image_record(
                doc["id"],
                url
            )

    pdf.close()

    mark_document_done(doc["id"])

def worker():
    print("Image worker started...")
    while True:
        docs = get_unprocessed_documents()
        for doc in docs:
            try:
                print("Processing:", doc["id"])
                extract_images_from_pdf(doc)
            except Exception as e:
                print("Error:", e)
        time.sleep(5)

if __name__ == "__main__":

    worker()