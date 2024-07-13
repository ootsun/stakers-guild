"use client";

import {useReadContract} from "wagmi";
import {useTargetNetwork} from "~~/hooks/scaffold-eth";
import React, {useEffect, useState} from "react";
import {LeaderboardMemberData} from "~~/app/_components/LeaderboardMembersData";
import {ethers} from "ethers";

type LeaderboardMemberIndexesProps = {
    deployedContractData: any;
};

export const LeaderboardMemberIndexes = ({deployedContractData}: LeaderboardMemberIndexesProps) => {
    const {targetNetwork} = useTargetNetwork();
    const [registeredValidators, setRegisteredValidators] = useState<number[]>([]);

    const {
        data: pendingValidatorColl,
        isFetching: isFetchingPending,
    } = useReadContract({
        address: deployedContractData.address,
        functionName: "getPendingValidatorColl",
        abi: deployedContractData.abi,
        chainId: targetNetwork.id,
        query: {
            retry: false,
        },
    });

    const {
        data: registeredValidatorColl,
        isFetching: isFetchingRegistered,
    } = useReadContract({
        address: deployedContractData.address,
        functionName: "getRegisteredValidatorColl",
        abi: deployedContractData.abi,
        chainId: targetNetwork.id,
        query: {
            retry: false,
        },
    });


    console.log("isFetchingPending || isFetchingRegistered", isFetchingPending || isFetchingRegistered)
    if (isFetchingPending || isFetchingRegistered) {
        return (
            <div className="mt-14">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    const registeredMemberIndexes = registeredValidatorColl as number[]
    const pendingMemberIndexes = pendingValidatorColl as number[]
    const memberIndexes = [...registeredMemberIndexes, ...pendingMemberIndexes]

    return (
        <>
            <LeaderboardMemberData memberIndexes={memberIndexes}
                                   deployedContractData={deployedContractData}/>
        </>

    )
};
