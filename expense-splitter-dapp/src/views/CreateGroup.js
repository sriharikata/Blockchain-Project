import { useState } from "react";

export default function CreateGroup({ setGroupId }) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([{ name: "", address: "" }]);

  const handleCreate = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupName,
        createdBy: members[0]?.address, // First member is the creator
        members,
      }),
    });
    const data = await res.json();
    if (data.groupId) {
      alert("Group created: " + data.groupId);
      setGroupId(data.groupId);
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  return (
    <div>
      <h3>Create Group</h3>
      <input
        className="form-control mb-3"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      {members.map((member, i) => (
        <div className="row mb-2" key={i}>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Member Name"
              value={member.name}
              onChange={(e) => handleMemberChange(i, "name", e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Wallet Address"
              value={member.address}
              onChange={(e) => handleMemberChange(i, "address", e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        className="btn btn-secondary me-2"
        onClick={() => setMembers([...members, { name: "", address: "" }])}
      >
        + Add Member
      </button>
      <button className="btn btn-success" onClick={handleCreate}>
        Create Group
      </button>
    </div>
  );
}