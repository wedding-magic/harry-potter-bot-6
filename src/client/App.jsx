import React from 'react';
import { useState, useEffect, useRef } from 'react';
import './styles.css';
import ChatLog from './components/ChatLog.jsx';
import CharSelect from './components/CharSelect.jsx';

//main app component to render chat ui

export default function App() {

  //initialize state variables

  const [history, setHistory] = useState([]);
  const [log, setLog] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [queried, setQueried] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [char, setChar] = useState('Amara');

  //clear chat history when selected character is changed, passed as prop to CharSelect component

  const handleCharChange = (val) => {setChar(val);
    setHistory([]);
    setLog([]);};

  const handleToggle = () => {
    setToggle(!toggle);
  };

  //submit handler for user input form, updates history and log state variables and clears input field

  function onSubmit(event) {
    event.preventDefault();
    setUserInput('');
    setHistory([...history, {'role': 'user', 'content' : `${userInput}`}]);
    setLog([...log, `You: ${userInput}`]);
    handleToggle();
  }

  //useEffect hook to ensure fetchData doesn't run on page load

  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      fetchData();
    }
    else {
      didMount.current = true;
    }
  }, [toggle]);

  //fetch chatbot response from server

  async function fetchData(){

    setQueried(true);
    console.log('reached here');
    console.log('history',history);

    fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({history: history, char: char, message: history[history.length-1]['content']})}).then(
      data => data.json()
    ).then( data => {
      setHistory([...history, {'role': 'assistant', 'content': `${data.result}`}]);
      setLog([...log, `${char}: ${data.result}`]);
      setQueried(false);
    }).catch(
      err => {console.log(err);
        handleToggle();
      });
        
        
  }

  //generate array for display of chat history

  function generateLogDisplay(){
    const res = [];
    for (let i = 0; i < log.length; i++) {
      if (i % 2 === 0) {
        res.push(<ChatLog text={log[i]} key={i} user={true} />);
      }
      else {
        res.push(<ChatLog text={log[i]} key={i} user={false} />);
      }
    }
    return res;
  }

  const logDisplay = generateLogDisplay();

  //render method for main app page

  return (

    <>  
      <div className="main">
        <h1 className="title">
            Harry Potter Bot Demo
        </h1>
        <p className="about">{`Demo version of chatbot app for conversing with and asking questions of AI characters 
        with external memories supplied by semantic search on a vector database. Amara Nightengale
        is a made up character in the harry potter universe with memories created by chatGPT, and Ron Weasley
        has memories scraped from `}<a href="https://harrypotter.fandom.com/wiki/Ronald_Weasley">harry potter wiki.</a>
        {' Could be extended to create videogame NPC\'s with dynamically added memories.'}</p>
        <CharSelect handleCharChange={handleCharChange} char={char}/>
        <div className="chatBox">
          <div>
            {logDisplay}
          </div>
          <div style={{fontWeight: 'bold'}}>
            {userInput ? `You: ${userInput}` : null}
          </div>
          <div>
            {queried ? `${char}: ...` : null}
          </div>
        </div>
        <div className="form">
          <input type="text" 
            name="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button onClick={onSubmit}>Submit</button>
        </div>
      </div>
    </>

  );
}