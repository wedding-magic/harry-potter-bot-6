import React from 'react';

//component for displaying chat messages, chats from user in bold

export default function ChatLog(props) {
  return (
    <div style={props.user ? {fontWeight: 'bold'} : null}>
      {props.text}
    </div>
  );
}