import os
from tkinter import Tk, filedialog
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def txt_to_pdf(txt_path, pdf_path):
    styles = getSampleStyleSheet()
    story = []

    with open(txt_path, 'r', encoding='utf-8') as file:
        for line in file:
            story.append(Paragraph(line.strip(), styles["Normal"]))

    doc = SimpleDocTemplate(pdf_path)
    doc.build(story)

def convert_folder():
    # Hide root window
    root = Tk()
    root.withdraw()

    # Select folder
    folder_path = filedialog.askdirectory(title="Select Folder with TXT Files")

    if not folder_path:
        print("No folder selected.")
        return

    print(f"Processing folder: {folder_path}")

    for file_name in os.listdir(folder_path):
        if file_name.endswith(".txt"):
            txt_file = os.path.join(folder_path, file_name)
            pdf_file = os.path.join(folder_path, file_name.replace(".txt", ".pdf"))

            try:
                txt_to_pdf(txt_file, pdf_file)
                print(f"Converted: {file_name} → {os.path.basename(pdf_file)}")
            except Exception as e:
                print(f"Error converting {file_name}: {e}")

    print("Done!")

if __name__ == "__main__":
    convert_folder()