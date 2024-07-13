"use client";

import {useReadContract} from "wagmi";
import {useTargetNetwork} from "~~/hooks/scaffold-eth";
import React, {useState} from "react";
import {Address} from "~~/components/scaffold-eth";

type LeaderboardMemberDataProps = {
    deployedContractData: any;
    memberIndexes: number[];
};

type Member = {
    address: string;
    validatorId: number;
    missedAttestation: number;
    claimableValue: number;
}

export const LeaderboardMemberData = ({deployedContractData, memberIndexes}: LeaderboardMemberDataProps) => {
    const {targetNetwork} = useTargetNetwork();

    console.log("memberIndexes", memberIndexes)
    const members = memberIndexes.map((index) => {
        const claimsCall = useReadContract({
            address: deployedContractData.address,
            functionName: "claimsMapping",
            abi: deployedContractData.abi,
            chainId: targetNetwork.id,
            args: [index],
            query: {
                retry: false,
            },
        });
        const attestationsCall = useReadContract({
            address: deployedContractData.address,
            functionName: "attestationMapping",
            abi: deployedContractData.abi,
            chainId: targetNetwork.id,
            args: [index],
            query: {
                retry: false,
            },
        });
        const addressesCall = useReadContract({
            address: deployedContractData.address,
            functionName: "addressMapping",
            abi: deployedContractData.abi,
            chainId: targetNetwork.id,
            args: [index],
            query: {
                retry: false,
            },
        });

        console.log("addressesCall", addressesCall)

        const member: Member = {
            address: String(addressesCall.data),
            validatorId: index,
            missedAttestation: Number(attestationsCall.data),
            claimableValue: Number(claimsCall.data)
        }
        return member;
    })
    const allLoaded = members.every((member) => {
        return member.address != "undefined" && member.missedAttestation >= 0 && member.claimableValue >= 0
    })
    if (!allLoaded) {
        return (
            <div className="mt-14">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }
    return (
        <>
            {memberIndexes.length > 0 && (
                <div className="overflow-x-auto mb-10">
                    <h2 className="text-3xl font-bold mb-6">Leaderboard</h2>
                    <table className="table">
                        {/* head */}
                        <thead>
                        <tr>
                            <th>Address</th>
                            <th>Validator index</th>
                            <th># missed attestations</th>
                            <th>Claimable ETH</th>
                        </tr>
                        </thead>
                        <tbody>
                        {members.map((member) => (
                            <tr key={member.validatorId}>
                                <td><Address address={member.address} format="long" /></td>
                                <td>{member.validatorId}</td>
                                <td>{member.missedAttestation}</td>
                                <td>{member.claimableValue}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};
