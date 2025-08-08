import { Confirmer, confirm } from '../components/confirmer-signal';

export function Signals() {
  const handleDelete = async () => {
    const confirmed = await confirm('Are you sure?');

    alert(confirmed ? 'Deleted' : 'Cancelled');
  };

  return (
    <div>
      <h1>Signals</h1>
      <Confirmer />
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
