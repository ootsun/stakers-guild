"use client";

import {Abi, AbiFunction} from "abitype";
import {useWriteContract} from "wagmi";
import {useDeployedContractInfo, useTargetNetwork, useTransactor} from "~~/hooks/scaffold-eth";
import {ContractName, GenericContract, InheritedFunctions} from "~~/utils/scaffold-eth/contract";
import {InputBase} from "~~/components/scaffold-eth";
import React, {useState} from "react";
import {parseEther} from "viem";

type RegisterUIProps = {
    contractName: ContractName;
};

export const ClaimForm = ({contractName}: RegisterUIProps) => {
    const {data: result, isPending, writeContractAsync} = useWriteContract();
    const {targetNetwork} = useTargetNetwork();
    const {data: deployedContractData, isLoading: deployedContractLoading} = useDeployedContractInfo(contractName);
    const writeTxn = useTransactor();

    const [claimDone, setClaimDone] = useState(false);
    const [claimAmount, setClaimAmount] = useState(0.1);

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

    const fn = (
        (deployedContractData.abi as Abi).filter(
            part => part.type === "function" && part.name === "claim",
        ) as AbiFunction[]
    ).map(fn => {
        return {
            fn,
            inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
        };
    })[0];

    if (!fn) {
        return (
            <p className="text-3xl mt-14">
                {`No "claim" function found on contract "${contractName}" on chain "${targetNetwork.name}"!`}
            </p>
        );
    }

    const handleWrite = async () => {
        if (writeContractAsync) {
            try {
                const makeWriteWithParams = () =>
                    writeContractAsync({
                        address: deployedContractData.address,
                        functionName: "claim",
                        abi: deployedContractData.abi,
                        args: [parseEther(claimAmount + "")],
                    });
                let smartContractResponse = await writeTxn(makeWriteWithParams);
                console.log("smartContractResponse", smartContractResponse)
                setClaimDone(true)
            } catch (e: any) {
                console.error("⚡️ ~ file: ClaimForm.tsx:handleWrite ~ error", e);
            }
        }
    };

    const inputPropsClaimAmount = {
        name: 'claimAmount',
        value: claimAmount,
        onChange: (value: any) => setClaimAmount(value)
    };

    return (
        <>
            {!claimDone && (
                <div
                    className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                    <InputBase {...inputPropsClaimAmount} />
                    <button className="btn btn-sm btn-primary" onClick={handleWrite}>Claim</button>
                </div>)}
            {claimDone && (
                <div
                    className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                    <p>Well deserved! 🎉 Keep your validator up and running to continue accruing rewards.</p>
                </div>)}
        </>
    );
};
