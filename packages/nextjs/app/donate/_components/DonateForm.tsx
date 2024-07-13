"use client";

import {Abi, AbiFunction} from "abitype";
import {useAccount, useSendTransaction, useWriteContract} from "wagmi";
import {useDeployedContractInfo, useTargetNetwork, useTransactor} from "~~/hooks/scaffold-eth";
import {ContractName, GenericContract, InheritedFunctions} from "~~/utils/scaffold-eth/contract";
import {InputBase} from "~~/components/scaffold-eth";
import React, {useEffect, useState} from "react";
import {parseEther} from "viem";

type DonateUIProps = {
    contractName: ContractName;
};

export const DonateForm = ({contractName}: DonateUIProps) => {
    const {targetNetwork} = useTargetNetwork();
    const {data: deployedContractData, isLoading: deployedContractLoading} = useDeployedContractInfo(contractName);

    const [donationAmount, setDonationAmount] = useState(0.1);

    const { data: hash, sendTransaction, isPending } = useSendTransaction()
console.log(hash)
console.log("isPending", isPending)

    if (deployedContractLoading) {
        return (
            <div className="mt-14">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!deployedContractData) {
        return (
            <p className="text-3xl mt-14">
                {`No contract found by the name of "${contractName}" on chain "${targetNetwork.name}"!`}
            </p>
        );
    }

    const inputPropsDonationAmount = {
        name: 'donationAmount',
        value: donationAmount,
        onChange: (value: any) => setDonationAmount(value)
    };

    const donate = async () => {
        sendTransaction({ to: deployedContractData.address, value: parseEther(donationAmount+"")})
    };

    return (
        <>
            {
                !hash && (
                    <div
                        className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                        <p>Enter the amount of ETH you are willing to donate to the Stakers Guild &#128176;</p>
                        <InputBase {...inputPropsDonationAmount} />
                        <button className="btn btn-sm btn-primary" onClick={donate}>Donate</button>
                    </div>
                )
            }
            {
                hash && (
                    <div
                        className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                        <p>Your donation is in! Thank you 🎉</p>
                    </div>
                )
            }
        </>
    );
};
