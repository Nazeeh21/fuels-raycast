import { ActionPanel, Action, List, Form, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { FuelAgent } from "fuel-agent-kit";
import { useState } from "react";
import nodeFetch from 'node-fetch';

// Polyfill fetch
if (!global.fetch) {
  (global as unknown as any).fetch = nodeFetch;
}

interface Operation {
  title: string;
  description: string;
  form: () => JSX.Element;
}

export default function Command() {
  const [showForm, setShowForm] = useState<string | null>(null);
  const preferences = getPreferenceValues();
  const agent = new FuelAgent({
    openAiApiKey: preferences.openaiApiKey,
    walletPrivateKey: preferences.fuelWalletPrivateKey,
    model: "gpt-4o-mini",
  });

  const operations: Record<string, Operation> = {
    transfer: {
      title: "Transfer Funds",
      description: "Send tokens to another address",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Execute Transfer"
                onSubmit={async (values) => {
                  try {
                    await agent.transfer({
                      to: values.address,
                      amount: values.amount,
                      symbol: values.symbol,
                    });
                    await showToast(Toast.Style.Success, "Transfer successful!");
                  } catch (error) {
                    await showToast(Toast.Style.Failure, "Transfer failed", String(error));
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="address" title="Recipient Address" placeholder="0x..." />
          <Form.TextField id="amount" title="Amount" placeholder="0.1" />
          <Form.TextField id="symbol" title="Token Symbol" placeholder="USDC" />
        </Form>
      ),
    },
    swap: {
      title: "Swap Assets",
      description: "Swap between different tokens",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Execute Swap"
                onSubmit={async (values) => {
                  try {
                    await agent.swapExactInput({
                      fromSymbol: values.fromSymbol,
                      amount: values.amount,
                      toSymbol: values.toSymbol,
                    });
                    await showToast(Toast.Style.Success, "Swap successful!");
                  } catch (error) {
                    await showToast(Toast.Style.Failure, "Swap failed", String(error));
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="fromSymbol" title="From Token" placeholder="USDC" />
          <Form.TextField id="amount" title="Amount" placeholder="100" />
          <Form.TextField id="toSymbol" title="To Token" placeholder="ETH" />
        </Form>
      ),
    },
    liquidity: {
      title: "Provide Liquidity",
      description: "Add liquidity to a pool",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Add Liquidity"
                onSubmit={async (values) => {
                  try {
                    await agent.addLiquidity({
                      amount0: values.amount0,
                      asset0Symbol: values.asset0Symbol,
                      asset1Symbol: values.asset1Symbol,
                    });
                    await showToast(Toast.Style.Success, "Liquidity added successfully!");
                  } catch (error) {
                    await showToast(Toast.Style.Failure, "Failed to add liquidity", String(error));
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="amount0" title="Amount" placeholder="100" />
          <Form.TextField id="asset0Symbol" title="First Asset" placeholder="USDC" />
          <Form.TextField id="asset1Symbol" title="Second Asset" placeholder="ETH" />
        </Form>
      ),
    },
    collateral: {
      title: "Supply Collateral",
      description: "Supply tokens as collateral",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Supply Collateral"
                onSubmit={async (values) => {
                  try {
                    await agent.supplyCollateral({
                      amount: values.amount,
                      symbol: values.symbol,
                    });
                    await showToast(Toast.Style.Success, "Collateral supplied successfully!");
                  } catch (error) {
                    await showToast(Toast.Style.Failure, "Failed to supply collateral", String(error));
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="amount" title="Amount" placeholder="100" />
          <Form.TextField id="symbol" title="Token Symbol" placeholder="USDC" />
        </Form>
      ),
    },
    borrow: {
      title: "Borrow Asset",
      description: "Borrow USDC against your collateral",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Borrow Asset"
                onSubmit={async (values) => {
                  try {
                    await agent.borrowAsset({
                      amount: values.amount,
                    });
                    await showToast(Toast.Style.Success, "Asset borrowed successfully!");
                  } catch (error) {
                    await showToast(Toast.Style.Failure, "Failed to borrow asset", String(error));
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField id="amount" title="Amount" placeholder="100" />
        </Form>
      ),
    },
    naturalLanguage: {
      title: "Execute Natural Language Command",
      description: "Enter a command in natural language",
      form: () => (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Execute Command"
                onSubmit={async (values) => {
                  try {
                    await agent.execute(values.command);
                    await showToast(Toast.Style.Success, "Command executed successfully!");
                  } catch (error) {
                    await showToast(Toast.Style.Failure, "Command execution failed", String(error));
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextArea id="command" title="Command" placeholder="Send 0.1 USDC to 0x..." />
        </Form>
      ),
    },
  };

  return (
    <>
      {showForm ? (
        operations[showForm].form()
      ) : (
        <List>
          {Object.entries(operations).map(([key, op]) => (
            <List.Item
              key={key}
              title={op.title}
              subtitle={op.description}
              actions={
                <ActionPanel>
                  <Action title={`Open ${op.title} Form`} onAction={() => setShowForm(key)} />
                </ActionPanel>
              }
            />
          ))}
        </List>
      )}
    </>
  );
}
