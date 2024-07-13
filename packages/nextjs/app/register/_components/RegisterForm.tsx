"use client";

import {Abi, AbiFunction} from "abitype";
import {useAccount, useWriteContract} from "wagmi";
import {useDeployedContractInfo, useTargetNetwork, useTransactor} from "~~/hooks/scaffold-eth";
import {ContractName, GenericContract, InheritedFunctions} from "~~/utils/scaffold-eth/contract";
import {InputBase, RainbowKitCustomConnectButton} from "~~/components/scaffold-eth";
import React, {useEffect, useState} from "react";
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'

type RegisterUIProps = {
    contractName: ContractName;
};

export const RegisterForm = ({contractName}: RegisterUIProps) => {
    const {data: result, isPending, writeContractAsync} = useWriteContract();
    const {targetNetwork} = useTargetNetwork();
    const {data: deployedContractData, isLoading: deployedContractLoading} = useDeployedContractInfo(contractName);
    const writeTxn = useTransactor();

    const {address: connectedAddress} = useAccount();

    const [connectStep, setConnectStep] = useState(false);
    const [worldIDStep, setWorldIDStep] = useState(false);
    const [validatorControlStep, setValidatorControlStep] = useState(false);
    const [worldIDStepSignedMessage, setWorldIDStepSignedMessage] = useState("");
    const [validatorControlValidatorSignedMessage, setValidatorControlValidatorSignedMessage] = useState("");
    const [validatorControlStepSignedMessage, setValidatorControlStepSignedMessage] = useState("");
    const [validatorControlValidatorId, setValidatorControlValidatorId] = useState(0);
    const [transactionSignatureStep, setTransactionSignatureStep] = useState(false);

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

    const handleVerify = async (proof: ISuccessResult) => {
        const res = await fetch("/api/verify/worldcoin", { // route to your backend will depend on implementation
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(proof),
        })
        if (!res.ok) {
            throw new Error("Verification failed."); // IDKit will display the error message to the user in the modal
        }
        setWorldIDStepSignedMessage(await res.json())
    };

    const onSuccess = () => {
        // This is where you should perform any actions after the modal is closed
        // Such as redirecting the user to a new page
        setWorldIDStep(true)
    };

    const verifyValidatorSignedMessage = async () => {
        const res = await fetch("/api/verify/validator", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({validatorSignedMessage: validatorControlValidatorSignedMessage, worldIDStepSignedMessage, validatorId: validatorControlValidatorId}),
        })
        if (!res.ok) {
            throw new Error("Verification failed.");
        }
        setValidatorControlStep(true)
        setValidatorControlStepSignedMessage(await res.json())
    }

    const inputPropsValidatorControlSignedMessage = {
        name: 'validatorControlValidatorSignedMessage',
        value: validatorControlValidatorSignedMessage,
        placeholder: 'Your signed message',
        onChange: (value: any) => setValidatorControlValidatorSignedMessage(value)
    };
    const inputPropsValidatorControlValidatorId = {
        name: 'validatorControlValidatorId',
        value: validatorControlValidatorId,
        placeholder: 'Your validator id',
        onChange: (value: any) => setValidatorControlValidatorId(value)
    };

    const handleWrite = async () => {
        if (writeContractAsync) {
            try {
                console.log("validatorControlValidatorId", validatorControlValidatorId)
                console.log("validatorControlStepSignedMessage", validatorControlStepSignedMessage)
                const makeWriteWithParams = () =>
                    writeContractAsync({
                        address: deployedContractData.address,
                        functionName: "register",
                        abi: deployedContractData.abi,
                        args: [validatorControlValidatorId],
                    });
                let smartContractResponse = await writeTxn(makeWriteWithParams);
                console.log("smartContractResponse", smartContractResponse)
                setTransactionSignatureStep(true)
            } catch (e: any) {
                console.error("⚡️ ~ file: RegisterForm.tsx:handleWrite ~ error", e);
            }
        }
    };

    return (
        <>
            <ul className="steps">
                <li className="step step-primary">Connection</li>
                <li className={`step ${connectStep ? 'step-primary' : ''}`}>World ID</li>
                <li className={`step ${worldIDStep ? 'step-primary' : ''}`}>Validator control</li>
                <li className={`step ${validatorControlStep ? 'step-primary' : ''}`}>Transaction signature</li>
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
                    <IDKitWidget
                        app_id="app_staging_b98a7bb6eed48c29f711c1a58dd1afca" // obtained from the Developer Portal
                        action="register" // obtained from the Developer Portal
                        onSuccess={onSuccess} // callback when the modal is closed
                        handleVerify={handleVerify} // callback when the proof is received
                        verification_level={VerificationLevel.Device}
                    >
                        {({ open }) =>
                            // This is the button that will open the IDKit modal
                            <button className="btn btn-sm btn-primary" onClick={open}>Verify with World ID</button>
                        }
                    </IDKitWidget>
                </div>)
            }
            {
                worldIDStep && !validatorControlStep && (
                    <div
                        className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                        <p>To prove that you are in control of the validator, please sign a message with its private key or its withdrawal address private key.</p>
                        <p>The message to sign is: <strong>OK</strong></p>
                        <InputBase {...inputPropsValidatorControlSignedMessage} />
                        <InputBase {...inputPropsValidatorControlValidatorId} />
                        <button className="btn btn-sm btn-primary" onClick={verifyValidatorSignedMessage}>Verify</button>
                    </div>
                )
            }
            {
                validatorControlStep && !transactionSignatureStep && (
                    <div
                        className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                        <p>Last step! You can now sign this transaction to be registered as a member and start earning rewards.</p>
                        <button className="btn btn-sm btn-primary" onClick={handleWrite}>Register</button>
                    </div>
                )
            }
            {
                transactionSignatureStep && (
                    <div
                        className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 my-5">
                        <p>You are now registered! Well done 🎉</p>
                    </div>
                )
            }
        </>
    );
};
