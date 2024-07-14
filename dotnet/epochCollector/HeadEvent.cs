using System.Text.Json.Serialization;

public partial class HeadEvent
{
    [JsonPropertyName("slot")]
    public string Slot { get; set; }

    [JsonPropertyName("block")]
    public string Block { get; set; }

    [JsonPropertyName("state")]
    public string State { get; set; }

    [JsonPropertyName("current_duty_dependent_root")]
    public string CurrentDutyDependentRoot { get; set; }

    [JsonPropertyName("previous_duty_dependent_root")]
    public string PreviousDutyDependentRoot { get; set; }

    [JsonPropertyName("epoch_transition")]
    public bool EpochTransition { get; set; }

    [JsonPropertyName("execution_optimistic")]
    public bool ExecutionOptimistic { get; set; }
}