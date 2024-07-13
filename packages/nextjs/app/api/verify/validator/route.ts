import {ethers, hashMessage} from "ethers";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
    const {validatorSignedMessage, worldIDStepSignedMessage, validatorId} = await request.json();

    const wallet = new ethers.Wallet("0x17f9c2fbf74cfd567b58eb32a30b56b708565815f8e7f800d7e550d8bdc7d0fd");

    const signerAddr = ethers.recoverAddress(hashMessage("OK"),worldIDStepSignedMessage);
    if(signerAddr !== wallet.address) {
        console.error("Invalid signer address")
        return NextResponse.error().json();
    }

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };

    //TODO This code is commented because we don't have a validator private key at our disposal to sign the message. Uncomment this code for production.
    // const quickNodeResponse = await fetch("https://ultra-spring-dawn.quiknode.pro/a193b9a57b68aa32ff3b32e3a7eeaccc9e333385/eth/v1/beacon/states/head/validators?status=active&id="+validatorId, requestOptions)
    // const quickNodeResponseJson = await quickNodeResponse.json();
    // console.log(quickNodeResponseJson)
    // const validatorPubKey = quickNodeResponseJson.data[0].validator.pubkey;
    // const signerAddr2 = ethers.recoverAddress(hashMessage("OK"),validatorSignedMessage);
    // console.log(signerAddr2)
    // console.log(validatorPubKey)
    // if(signerAddr2 !== validatorPubKey) {
    //     console.error("Invalid validator signer address")
    //     return NextResponse.error().json();
    // }

    // Sign the message
    const signedMessage = await wallet.signMessage(validatorId);
    console.log({signedMessage})
    return NextResponse.json(signedMessage)
}
