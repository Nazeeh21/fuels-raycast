import { Detail, Form, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";

export default function Command() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchAddressInfo = async (address: string) => {
    try {
      // Add your API calls here to fetch balance and transactions
      // Example:
      // const balanceResponse = await fetch(`YOUR_API_ENDPOINT/balance/${address}`);
      // const balance = await balanceResponse.json();
      // setBalance(balance);
      // const txResponse = await fetch(`YOUR_API_ENDPOINT/transactions/${address}`);
      // const transactions = await txResponse.json();
      // setTransactions(transactions);
    } catch (error) {
      console.error("Error fetching address info:", error);
    }
  };

  const renderContent = () => {
    if (!address) {
      return "# Please enter an address";
    }

    return `
# Address Details

## Balance
${balance ?? "Loading..."}

## Recent Transactions
${transactions.length > 0 ? transactions.map((tx) => `- ${tx.hash}: ${tx.value}`).join("\n") : "No transactions found"}
    `;
  };

  return (
    <Detail
      markdown={renderContent()}
      actions={
        <ActionPanel>
          <Action.Push
            title="Enter Address"
            target={
              <Form
                actions={
                  <ActionPanel>
                    <Action.SubmitForm
                      title="Submit"
                      onSubmit={({ addressInput }) => {
                        setAddress(addressInput);
                        fetchAddressInfo(addressInput);
                      }}
                    />
                  </ActionPanel>
                }
              >
                <Form.TextField id="addressInput" title="Address" placeholder="Enter address" />
              </Form>
            }
          />
        </ActionPanel>
      }
    />
  );
}
