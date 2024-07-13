import React from "react";
import { ClaimForm } from "./_components/ClaimForm";
import { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Claim",
  description: "Claim your rewards",
});

const Claim: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 p-10">
        <h1 className="text-4xl my-0">Claim</h1>
        <p className="text-neutral">Welcome to the reward claim page of Solo Staker Guild. Here, you can claim your earned rewards for contributing to the decentralization and security of the Ethereum network. Simply follow the steps below to receive your rewards.
        </p>
        <ClaimForm contractName="YourContract" />
      </div>
    </>
  );
};

export default Claim;
