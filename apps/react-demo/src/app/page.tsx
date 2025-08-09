'use client';

import { Confirmer, StackableConfirmer, confirm, stackableConfirm } from '../components/confirmer';

export default function Home() {
  const handleDelete = async () => {
    const confirmed = await confirm('Are you sure?');

    alert(confirmed ? 'Deleted' : 'Cancelled');
  };

  const handleStackableDelete = async () => {
    console.log('handleStackableDelete');

    const confirmed = await stackableConfirm('Start');

    alert(confirmed ? 'Stackable Call Confirmed' : 'Stackable Call Cancelled');
  };

  return (
    <div>
      <h1>React</h1>
      <Confirmer />
      <button onClick={handleDelete}>Delete</button>
      <StackableConfirmer />
      <button onClick={handleStackableDelete}>Stackable Call</button>
    </div>
  );
}
