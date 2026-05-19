import { DISCLAIMER, type CodegenResult } from "../../core/types.js";

export interface CodegenCsharpInput {
  profile?: string;
  preGasMs?: number;
  postGasMs?: number;
}

export function generateCsharp(input: CodegenCsharpInput = {}): CodegenResult {
  const profile = input.profile ?? "default";
  const preGasMs = input.preGasMs ?? 200;
  const postGasMs = input.postGasMs ?? 500;

  const code = `// Laser control state machine — profile: ${profile}
// PreGas ${preGasMs} ms, PostGas ${postGasMs} ms
public enum LaserState { Idle, PreGas, Ready, Lasing, PostGas, Fault }

public sealed class LaserController
{
    public LaserState State { get; private set; } = LaserState.Idle;
    public bool GasEnable { get; private set; }
    public bool RequestEmission { get; private set; }
    public bool OpenShutter { get; private set; }
    public bool Fault { get; private set; }
    public bool Busy { get; private set; }

    private DateTime? _gasStart;
    private readonly int _preGasMs = ${preGasMs};
    private readonly int _postGasMs = ${postGasMs};

    public void Tick(bool enable, bool startWeld, bool stopWeld, bool resetFault,
        bool laserReady, bool shutterOpen, bool gasOk, bool faultIn)
    {
        if (resetFault) Fault = false;
        if (faultIn || Fault) { State = LaserState.Fault; RequestEmission = false; OpenShutter = false; return; }

        switch (State)
        {
            case LaserState.Idle:
                GasEnable = false;
                RequestEmission = false;
                OpenShutter = false;
                Busy = false;
                if (enable && !Fault) { State = LaserState.PreGas; GasEnable = true; _gasStart = DateTime.UtcNow; Busy = true; }
                break;
            case LaserState.PreGas:
                if (_gasStart.HasValue && (DateTime.UtcNow - _gasStart.Value).TotalMilliseconds >= _preGasMs && gasOk)
                    State = LaserState.Ready;
                break;
            case LaserState.Ready:
                OpenShutter = true;
                if (startWeld && laserReady && shutterOpen && gasOk)
                    { State = LaserState.Lasing; RequestEmission = true; }
                if (stopWeld || !enable)
                    { State = LaserState.PostGas; RequestEmission = false; OpenShutter = false; _gasStart = DateTime.UtcNow; }
                break;
            case LaserState.Lasing:
                RequestEmission = laserReady && shutterOpen && gasOk;
                if (stopWeld || !enable) { State = LaserState.PostGas; RequestEmission = false; OpenShutter = false; _gasStart = DateTime.UtcNow; }
                break;
            case LaserState.PostGas:
                GasEnable = true;
                if (_gasStart.HasValue && (DateTime.UtcNow - _gasStart.Value).TotalMilliseconds >= _postGasMs)
                    { GasEnable = false; State = LaserState.Idle; Busy = false; }
                break;
            case LaserState.Fault:
                GasEnable = false;
                RequestEmission = false;
                OpenShutter = false;
                Fault = true;
                break;
        }
    }
}
`;

  return {
    language: "csharp",
    code,
    profile,
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
