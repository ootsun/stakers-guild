using System;
using System.Threading.Tasks;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Contracts;
using System.Numerics;
using Nethereum.Util;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.ABI;
using System.Text.Json;

// [Function("genesisBlockNumber", "uint256")]
// public class GetGenesisBlockFunction : FunctionMessage
// {}

// [Function("getRegisteredValidators", "uint32[]")]
// public class GetRegisteredValidatorsFunction : FunctionMessage
// {}

[FunctionOutput]
public class GetGenesisBlockOutputDTO
{
    [Parameter("uint")]
    public BigInteger Number { get; set; }
}

[FunctionOutput]
public class GetRegisteredValidatorsOutputDTO
{
    [Parameter("uint32[]")]
    public List<uint> Numbers { get; set; }
}

class Program
{
    static async Task Main(string[] args)
    {
        // Connect to the local Hardhat network
        var url = "http://127.0.0.1:8545";
        var web3 = new Web3(url);
        
        var contractJsonString = File.ReadAllText("../../packages/hardhat/deployments/localhost/YourContract.json");
        var yourContract = JsonSerializer.Deserialize<YourContract>(contractJsonString);
        var contract = web3.Eth.GetContract(JsonSerializer.Serialize(yourContract.Abi), yourContract.Address);

        //an alternative
        // var getGenesisBlockFunction = new GetGenesisBlockFunction();
        // var getGenesisBlockHandler = web3.Eth.GetContractQueryHandler<GetGenesisBlockFunction>();
        // var balanceBigInt = await getGenesisBlockHandler.QueryAsync<BigInteger>(contract.Address, getGenesisBlockFunction);

        var getGenesisBlockFunction = contract.GetFunction("genesisBlockNumber");
        bool startDonationHappened = false;
        while(!startDonationHappened)
        {
            Thread.Sleep(2000);
            var resultGetGenesisBlock = await getGenesisBlockFunction.CallDeserializingToObjectAsync<GetGenesisBlockOutputDTO>();
            Console.WriteLine($"GenesisBlockNumber = {resultGetGenesisBlock.Number}");
            startDonationHappened = resultGetGenesisBlock.Number != 0;
        }
        Console.WriteLine("Startdonation occurred");

        // HttpClient httpClient = new HttpClient { BaseAddress = new Uri("https://docs-demo.quiknode.pro") };
        // Task<Stream> stream = httpClient.GetStreamAsync("eth/v1/events?topics=head");
        // using (var reader = new StreamReader(await stream))
        // {
        //     while (!reader.EndOfStream)
        //     {
        //         var line = await reader.ReadLineAsync();
        //         Console.WriteLine(line);
        //     }
        // }

        var getRegisteredValidatorsFunction = contract.GetFunction("getRegisteredValidatorColl");
        var resultGetRegisteredValidators = await getRegisteredValidatorsFunction.CallDeserializingToObjectAsync<GetRegisteredValidatorsOutputDTO>();
        foreach (var number in resultGetRegisteredValidators.Numbers)
        {
            Console.WriteLine(number);
        }
    }
}