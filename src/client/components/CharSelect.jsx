import React from 'react';
import { RadioGroup, ReversedRadioButton } from 'react-radio-buttons';

//radio buttons component for selecting character to chat with
  
export default function CharSelect(props){

  
  return (
    <div className="radioButtonsContainer">
      <label id="radioButtonsLabel">{'select character to chat with: '}</label>
      <div className="radioButtons">
        <RadioGroup onChange={ props.handleCharChange } value= {props.char} horizontal >
          <ReversedRadioButton value="Amara" pointColor="#87B9E1" rootColor="#C0C0C0">
            {'Amara Nightingale'}
          </ReversedRadioButton>
          <ReversedRadioButton value="Ron" pointColor="#87B9E1" rootColor="#C0C0C0">
            {'Ron Weasley'}
          </ReversedRadioButton>
        </RadioGroup>
      </div>
    </div>

  );

}