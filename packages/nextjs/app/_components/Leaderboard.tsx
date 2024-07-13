"use client";

import {useDeployedContractInfo, useTargetNetwork} from "~~/hooks/scaffold-eth";
import {ContractName} from "~~/utils/scaffold-eth/contract";
import React, {useState} from "react";
import {LeaderboardMemberIndexes} from "~~/app/_components/LeaderboardMemberIndexes";

type RegisterUIProps = {
    contractName: ContractName;
};

type Member = {
    address: string;
    validatorId: number;
    missedAttestation: number;
    claimableValue: number;
}

export const Leaderboard = ({contractName}: RegisterUIProps) => {
    const {targetNetwork} = useTargetNetwork();
    const {data: deployedContractData, isLoading: deployedContractLoading} = useDeployedContractInfo(contractName);

    const [members, setMembers] = useState<Member[]>([]);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

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

    return (
        <>
            <LeaderboardMemberIndexes deployedContractData={deployedContractData}/>
        </>
    );
};
