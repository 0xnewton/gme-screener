import type { Meta, StoryObj } from "@storybook/react";
import { Leaderboard } from "./Leaderboard";

const meta = {
  title: "Components/Leaderboard",
  component: Leaderboard,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Leaderboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    loading: false,
    tokens: [],
  },
};
