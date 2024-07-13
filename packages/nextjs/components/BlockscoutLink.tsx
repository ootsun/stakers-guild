"use client";

import {ArrowTopRightOnSquareIcon} from "@heroicons/react/20/solid";

type BlockscoutLinkProps = {
    hash?: string;
    address?: string;
};

export const BlockscoutLink = ({hash, address}: BlockscoutLinkProps) => {

    if (!hash && !address) {
        return null;
    }
    return (
        <>
            {hash && (<a
                className={`inline`}
                href={`https://eth-sepolia.blockscout.com/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
            >
                <ArrowTopRightOnSquareIcon className="mx-0.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer flex-shrink-0 inline"/>
            </a>)}
            {address && (<a
                className={`inline`}
                href={`https://eth-sepolia.blockscout.com/address/${address}`}
                target="_blank"
                rel="noreferrer">
                <ArrowTopRightOnSquareIcon className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer flex-shrink-0"/>
            </a>)}
        </>


    );
};
