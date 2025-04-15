import { useEffect, useState } from "react";

export default function GroupSelector({ onSelect }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const load = async () => {
      // const res = await fetch("http://localhost:5000/api/groups");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`);
      const data = await res.json();
      setGroups(data);
    };
    load();
  }, []);

  return (
    <div className="mb-4">
      <label>Select Group</label>
      <select
        className="form-select"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Select a group</option>
        {groups.map((g) => (
          <option key={g.groupId} value={g.groupId}>
            {g.groupName}
          </option>
        ))}
      </select>
    </div>
  );
}
