import { type IVerifyResponse, verifyCloudProof } from '@worldcoin/idkit-core/backend'
import {NextResponse} from "next/server";
import {ethers} from "ethers";

export async function POST(request: Request) {
    const proof = await request.json();
    console.log(proof)
    const app_id = "app_staging_b98a7bb6eed48c29f711c1a58dd1afca"
    const action = "register"
    const verifyRes = (await verifyCloudProof(proof, app_id, action)) as IVerifyResponse

    if (verifyRes.success) {
        // This is where you should perform backend actions if the verification succeeds
        // Such as, setting a user as "verified" in a database
        const wallet = new ethers.Wallet("0x17f9c2fbf74cfd567b58eb32a30b56b708565815f8e7f800d7e550d8bdc7d0fd");

        // Sign the message
        const signedMessage = await wallet.signMessage("OK");
        return NextResponse.json(signedMessage)
    } else {
        console.log(verifyRes)
        // This is where you should handle errors from the World ID /verify endpoint.
        // Usually these errors are due to a user having already verified.
        console.error("Verification failed.")
        throw new Error("Verification failed.")
    }
}
