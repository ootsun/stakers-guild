using System.Text.Json.Serialization;

public partial class YourContract
{
    [JsonPropertyName("address")]
    public string Address { get; set; }

    [JsonPropertyName("abi")]
    public Abi[] Abi { get; set; }
}

public partial class Abi
{
    [JsonPropertyName("inputs")]
    public Put[] Inputs { get; set; }

    [JsonPropertyName("stateMutability")]
    public string StateMutability { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("outputs")]
    public Put[] Outputs { get; set; }
}

public partial class Put
{
    [JsonPropertyName("internalType")]
    public string InternalType { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; }
}