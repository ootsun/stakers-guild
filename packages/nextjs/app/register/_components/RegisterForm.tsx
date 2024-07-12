"use client";

import {Abi, AbiFunction} from "abitype";
import {useAccount, useWriteContract} from "wagmi";
import {WriteOnlyFunctionForm} from "~~/app/debug/_components/contract";
import {useDeployedContractInfo, useTargetNetwork} from "~~/hooks/scaffold-eth";
import {ContractName, GenericContract, InheritedFunctions} from "~~/utils/scaffold-eth/contract";
import {RainbowKitCustomConnectButton} from "~~/components/scaffold-eth";
import React, {useEffect, useState} from "react";
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'

type RegisterUIProps = {
    contractName: ContractName;
};

export const RegisterForm = ({contractName}: RegisterUIProps) => {
    const {data: result, isPending, writeContractAsync} = useWriteContract();
    const {targetNetwork} = useTargetNetwork();
    const {data: deployedContractData, isLoading: deployedContractLoading} = useDeployedContractInfo(contractName);

    const {address: connectedAddress} = useAccount();

    const [connectStep, setConnectStep] = useState(false);
    const [worldIDStep, setWorldIDStep] = useState(false);
    const [validatorControlStep, setValidatorControlStep] = useState(false);

    useEffect(() => {
        if (connectedAddress) {
            setConnectStep(true);
        }
    })

    if (!deployedContractData) {
        return (
            <p className="text-3xl mt-14">
                {`No contract found by the name of "${contractName}" on chain "${targetNetwork.name}"!`}
            </p>
        );
    }

    const fn = (
        (deployedContractData.abi as Abi).filter(
            part => part.type === "function" && part.name === "register",
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
                {`No "register" function found on contract "${contractName}" on chain "${targetNetwork.name}"!`}
            </p>
        );
    }

    function onChange() {
        console.log("onChange");
    }

    const handleVerify = async (proof: ISuccessResult) => {
        const res = await fetch("/api/verify", { // route to your backend will depend on implementation
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(proof),
        })
        if (!res.ok) {
            throw new Error("Verification failed."); // IDKit will display the error message to the user in the modal
        }
    };

    const onSuccess = () => {
        // This is where you should perform any actions after the modal is closed
        // Such as redirecting the user to a new page
        setWorldIDStep(true)
    };


    return (
        <>
            <ul className="steps">
                <li className="step step-primary">Connect your wallet</li>
                <li className={`step ${connectStep ? 'step-primary' : ''}`}>World ID</li>
                <li className="step">Validator control</li>
            </ul>
            {!connectStep && (
                <div
                    className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                    <p>Please connect the wallet you wish to register</p>
                    <RainbowKitCustomConnectButton/>
                </div>)
            }
            {connectStep && !worldIDStep && (
                <div
                    className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                    <p>Please go in your Worldcoin App</p>
                    <IDKitWidget
                        app_id="your app id" // obtained from the Developer Portal
                        action="your action id" // obtained from the Developer Portal
                        onSuccess={onSuccess} // callback when the modal is closed
                        handleVerify={handleVerify} // callback when the proof is received
                        verification_level={VerificationLevel.Orb}
                    >
                        {({ open }) =>
                            // This is the button that will open the IDKit modal
                            <button onClick={open}>Verify with World ID</button>
                        }
                    </IDKitWidget>
                </div>)
            }
            {/*<WriteOnlyFunctionForm*/}
            {/*  abi={deployedContractData.abi as Abi}*/}
            {/*  key={`${fn.fn.name}`}*/}
            {/*  abiFunction={fn.fn}*/}
            {/*  onChange={onChange}*/}
            {/*  contractAddress={deployedContractData.address}*/}
            {/*  inheritedFrom={fn.inheritedFrom}*/}
            {/*/>*/}
        </>
    );
};
