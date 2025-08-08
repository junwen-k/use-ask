import { Confirmer, confirm } from '../components/confirmer';

export function Hooks() {
  const handleDelete = async () => {
    const confirmed = await confirm('Are you sure?');

    alert(confirmed ? 'Deleted' : 'Cancelled');
  };

  return (
    <div>
      <h1>Hooks</h1>
      <Confirmer />
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
