import axios from "axios";

// Cryptio API key and transaction hash
const cryptioApiKey = "2e737658-575d-4b42-8625-616c5f115cb5";
const transactionHash =
  "0xfdf027f88de3290e8493086abdf24b2b1316c3159be2b5ef06109784c81cbbc7";

// Labels for revenue and ignored transactions
const revenueLabel = "1e7c5038-52f6-452b-9d40-cac8e572920a";
const ignoreLabel = "845eb3d0-2f73-4848-93fe-2f90efbc4d43";

// URLs for API endpoints
const apiMovementsUrl = `https://app-api.cryptio.co/api/movement?transaction_hashes=${transactionHash}`;
const apiAddLabelUrl = "https://app-api.cryptio.co/api/label";

// Function to get headers for API requests
const getHeaders = () => ({
  "cryptio-api-key": cryptioApiKey,
  "Content-Type": "application/json",
});

// Function to fetch data from the Cryptio API
const fetchTransactions = async () => {
  try {
    const response = await axios.get(apiMovementsUrl, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error.response ? error.response.data : error.message);
  }
};

// Function to apply a label to movements
const applyLabel = async (label, movementIds) => {
  try {
    const url = `${apiAddLabelUrl}/${label}/apply`;
    await axios.post(url, { movements: movementIds }, { headers: getHeaders() });
    console.log(`${label === revenueLabel ? "Revenue" : "Ignore"} label added`);
  } catch (error) {
    console.error("Error applying label:", error);
  }
};

// Function to process and label transactions
const processAndLabelTransactions = async () => {
  try {
    const transactions = await fetchTransactions();
    const groupedTransactions = new Map();

    transactions.data.forEach((transaction) => {
      const assetId = transaction.asset;
      if (!groupedTransactions.has(assetId)) {
        groupedTransactions.set(assetId, []);
      }
      groupedTransactions.get(assetId).push(transaction);
    });

    groupedTransactions.forEach((transactions, assetId) => {
      let volumeIn = 0;
      let volumeOut = 0;
      const movementIds = transactions.map(transaction => {
        if (transaction.direction === "in") {
          volumeIn += parseFloat(transaction.volume);
        } else if (transaction.direction === "out") {
          volumeOut += parseFloat(transaction.volume);
        }
        return transaction.id;
      });

      const volumeDifference = volumeIn - volumeOut;
      const label = volumeDifference === 0 ? ignoreLabel : revenueLabel;
      applyLabel(label, movementIds);
      console.log(`Volume difference for asset id ${assetId}: ${volumeDifference}`);
    });
  } catch (error) {
    console.error("Error processing transactions:", error);
  }
};

// Call the function to start the process
processAndLabelTransactions();
