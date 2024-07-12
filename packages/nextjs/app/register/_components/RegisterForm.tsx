"use client";

import { Abi, AbiFunction } from "abitype";
import { useWriteContract } from "wagmi";
import { WriteOnlyFunctionForm } from "~~/app/debug/_components/contract";
import { useDeployedContractInfo, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { ContractName, GenericContract, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

type RegisterUIProps = {
  contractName: ContractName;
};

export const RegisterForm = ({ contractName }: RegisterUIProps) => {
  const { data: result, isPending, writeContractAsync } = useWriteContract();
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);

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

  return (
    <>
      <WriteOnlyFunctionForm
        abi={deployedContractData.abi as Abi}
        key={`${fn.fn.name}`}
        abiFunction={fn.fn}
        onChange={onChange}
        contractAddress={deployedContractData.address}
        inheritedFrom={fn.inheritedFrom}
      />
    </>
  );
};
