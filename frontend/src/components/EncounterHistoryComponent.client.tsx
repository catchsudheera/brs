import React, { useEffect, useState } from 'react';

const EncounterHistoryComponent = () => {

  const [input1, setInput1] = useState(0);
  const [input2, setInput2] = useState(0);
  const [input3, setInput3] = useState(0);
  const [input4, setInput4] = useState(0);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const res = await fetch(`https://brs.aragorn-media-server.duckdns.org/encounters-for-players?teamAp1=${input1}&teamAp2=${input2}&teamBp1=${input3}&teamBp2=${input4}`);
    const data = await res.json();
    setResult(data);
    console.log(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Player 1: </label>
          <input type="number" value={input1} onChange={(e) => setInput1(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Player 2: </label>
          <input type="number" value={input2} onChange={(e) => setInput2(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Player 1: </label>
          <input type="number" value={input3} onChange={(e) => setInput3(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Player 2: </label>
          <input type="number" value={input4} onChange={(e) => setInput4(parseInt(e.target.value))} />
        </div>
        <button type="submit">Get encounters</button>
      </form>
      {result !== null && <div>Result: {JSON.stringify(result)}</div>}
    </div>
  );
};

export default EncounterHistoryComponent;
