export const buildTimeline = (

caseData,
hearings,
documents,
history

) => {

const timeline:any[] = [];

timeline.push({

title:"Case Filed",

date:caseData.created_at

});

history.forEach(h => {

timeline.push({

title:h.status,

date:h.created_at

});

});

hearings.forEach(h => {

timeline.push({

title:`Hearing ${h.hearing_no}`,

date:h.hearing_date

});

});

documents.forEach(d => {

if(d.type === "JUDGMENT"){

timeline.push({

title:"Judgment Uploaded",

date:d.created_at

});

timeline.push({

title:"Case Disposed",

date:d.created_at

});

}

});

return timeline;

};