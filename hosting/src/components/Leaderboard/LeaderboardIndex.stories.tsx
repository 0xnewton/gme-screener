import type { Meta, StoryObj } from "@storybook/react";
import Leaderboard from "./index";

const meta = {
  title: "Components/LeaderboardDataLoading",
  component: Leaderboard,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Leaderboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
