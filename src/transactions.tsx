import { Detail, Form, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";

export default function Command() {
  const [address, setAddress] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = async (address: string) => {
    try {
      // Add your API call here to fetch transactions
      // const txResponse = await fetch(`YOUR_API_ENDPOINT/transactions/${address}`);
      // const transactions = await txResponse.json();
      // setTransactions(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const renderContent = () => {
    if (!address) {
      return "# Please enter an address";
    }

    return `
# Transaction History ${address}

${transactions.length > 0 
  ? transactions.map(tx => `- ${tx.hash}: ${tx.value}`).join('\n')
  : "No transactions found"}
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
                        fetchTransactions(addressInput);
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