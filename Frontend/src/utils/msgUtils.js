const addOrUpdateMsg = (msgsArray, aiMsg, text) => {
  const msgExists = msgsArray.some(msg => msg._id === aiMsg._id);
  let updatedMsgs = [];
  // console.log(msgExists);
  if (!msgExists) {
    aiMsg.parts[0].text = text;
    updatedMsgs = [...msgsArray, aiMsg];
  } else {
    updatedMsgs = msgsArray.map(msg =>
      msg._id === aiMsg._id ? { ...msg, parts: [{ ...msg.parts[0], text: msg.parts[0].text + text }] } : msg
    );
  }
  return updatedMsgs;
};

export { addOrUpdateMsg };
