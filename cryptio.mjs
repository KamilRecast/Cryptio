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
function getHeaders() {
  return {
    "cryptio-api-key": cryptioApiKey,
    "Content-Type": "application/json",
  };
}

// Function to fetch data from the Cryptio API
async function getData() {
  try {
    const response = await axios.get(apiMovementsUrl, {
      headers: getHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error(
      "Error during the request",
      error.response ? error.response.data : error.message
    );
  }
}

// Function to apply a label to movements
async function applyLabel(label, movementId) {
  try {
    const data = {
      movements: movementId,
    };
    const url = `${apiAddLabelUrl}/${label}/apply`;
    await axios.post(url, data, { headers: getHeaders() });
    console.log(`${label === revenueLabel? 'Revenue' : 'Ignore'} label added`);
  } catch (error) {
    console.error("Error during the request ", error);
  }
}

// Function to calculate volume difference and apply labels
function CalcVolumeAndApplyLabel(groupedTransactions) {
  groupedTransactions.forEach((transactions, assetId) => {
    let volumeIn = 0;
    let volumeOut = 0;
    let idArray = [];
    transactions.forEach((transaction) => {
      if (transaction.direction === "in") {
        volumeIn += parseFloat(transaction.volume);
      } else if (transaction.direction === "out") {
        volumeOut += parseFloat(transaction.volume);
      }
      idArray.push(transaction.id);
    });

    const volumeDifference = volumeIn - volumeOut;
    if (volumeDifference === 0) {
      applyLabel(ignoreLabel, idArray);
    } else {
      applyLabel(revenueLabel, idArray);
    }
    console.log(
      `Volume difference for asset id ${assetId}: ${volumeDifference}`
    );
  });
}

// Function to group transactions by asset id
function groupTransactions(transactions) {
  const groupedTransactions = new Map();
  transactions.data.forEach((transaction) => {
    const assetId = transaction.asset;
    if (groupedTransactions.has(assetId)) {
      groupedTransactions.get(assetId).push(transaction);
    } else {
      groupedTransactions.set(assetId, [transaction]);
    }
  });
  return groupedTransactions;
}

// Function to update data by fetching, grouping, and applying labels
async function updatingData() {
  try {
    const transactions = await getData();
    const groupedTransactions = groupTransactions(transactions);
    CalcVolumeAndApplyLabel(groupedTransactions);
  } catch (error) {
    console.error("Error during comparing assets: ", error);
  }
}

// Call the updatingData function to start the process
updatingData();
