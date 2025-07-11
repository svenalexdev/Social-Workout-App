import ChatBubble from './ChatBubble';
const Chat = ({ messages, chatRef }) => {
  return (
    <div ref={chatRef} id='results' className='flex-1 w-full p-4 sm:p-8 bg-slate-600 rounded-lg shadow-md overflow-y-auto'>
      {messages?.map(msg => {
        return <ChatBubble key={msg._id} msg={msg} />;
      })}
    </div>
  );
};

export default Chat;
