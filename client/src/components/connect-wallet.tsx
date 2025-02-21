const ConnectWallet = ({ connect }: { connect: () => Promise<void> }) => {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-none">
        <button className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition" onClick={connect}>
          Connect Wallet
        </button>
      </div>
    );
  };
  
  export default ConnectWallet;