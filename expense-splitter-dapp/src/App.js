import { useState } from "react";
import Navbar from "./components/Navbar";
import CreateGroup from "./views/CreateGroup";
import AddExpense from "./views/AddExpense";
import GroupSummary from "./views/GroupSummary";
import GroupSelector from "./components/GroupSelector";
import Home from "./views/Home";
import WalletDashboard from "./views/WalletDashboard";
import GroupsPage from "./views/GroupsPage";
import SettleUpView from "./views/SettleUpView";

function App() {
  const [signer, setSigner] = useState(null);
  const [view, setView] = useState("home");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);


  const handleWalletConnect = (connectedSigner) => {
    setSigner(connectedSigner);
    setView("dashboard");
  };

  return (
    <div className="App">
      <Navbar
        setView={setView}
        setSigner={setSigner}
        signer={signer}
        view={view}
      />

      {!signer && view === "home" && (
        <Home onConnect={handleWalletConnect} />
      )}

      {signer && view === "dashboard" && (
  <WalletDashboard signer={signer} />
      )}

      {signer && view === "create" && (
        <CreateGroup setGroupId={setSelectedGroupId} />
      )}

      {signer && view === "add" && (
        <AddExpense setView={setView} />
      )}


      {signer && view === "groups" && (
        <GroupsPage
          signer={signer}
          setView={setView}
          setSelectedGroup={setSelectedGroup}
        />
      )}


      {signer && view === "settle" && selectedGroup && (
        <SettleUpView signer={signer} group={selectedGroup} setView={setView} />
      )}


    </div>
  );
}

export default App;
