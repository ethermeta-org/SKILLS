FUNCTION_BLOCK FB_LaserControl
VAR_INPUT
    Enable          : BOOL;
    StartWeld       : BOOL;
    StopWeld        : BOOL;
    ResetFault      : BOOL;
    LaserReady      : BOOL;   (* from laser status *)
    ShutterOpen     : BOOL;
    GasOK           : BOOL;
    FaultIn         : BOOL;
END_VAR
VAR_OUTPUT
    GasEnable       : BOOL;
    RequestEmission : BOOL;
    OpenShutter     : BOOL;
    Fault           : BOOL;
    Busy            : BOOL;
END_VAR
VAR
    state           : (Idle, PreGas, Ready, Lasing, PostGas, Fault);
    tonPreGas       : TON;
    tonPostGas      : TON;
    PreGasMs        : TIME := T#{{PRE_GAS_MS}}ms;
    PostGasMs       : TIME := T#{{POST_GAS_MS}}ms;
    rStart          : R_TRIG;
    rStop           : R_TRIG;
    rReset          : R_TRIG;
END_VAR

rStart(CLK := StartWeld);
rStop(CLK := StopWeld);
rReset(CLK := ResetFault);

IF rReset.Q THEN
    Fault := FALSE;
END_IF

IF FaultIn OR Fault THEN
    state := Fault;
    RequestEmission := FALSE;
    OpenShutter := FALSE;
    Busy := FALSE;
END_IF

CASE state OF
    Idle:
        GasEnable := FALSE;
        RequestEmission := FALSE;
        OpenShutter := FALSE;
        Busy := FALSE;
        IF Enable AND NOT Fault THEN
            state := PreGas;
            GasEnable := TRUE;
            tonPreGas(IN := TRUE, PT := PreGasMs);
        END_IF

    PreGas:
        Busy := TRUE;
        tonPreGas(IN := TRUE, PT := PreGasMs);
        IF tonPreGas.Q AND GasOK THEN
            tonPreGas(IN := FALSE);
            state := Ready;
        END_IF

    Ready:
        OpenShutter := TRUE;
        RequestEmission := FALSE;
        IF rStart.Q AND LaserReady AND ShutterOpen AND GasOK AND NOT Fault THEN
            state := Lasing;
            RequestEmission := TRUE;
        END_IF
        IF rStop.Q OR NOT Enable THEN
            state := PostGas;
            RequestEmission := FALSE;
            OpenShutter := FALSE;
            tonPostGas(IN := TRUE, PT := PostGasMs);
        END_IF

    Lasing:
        Busy := TRUE;
        RequestEmission := LaserReady AND ShutterOpen AND GasOK AND NOT Fault;
        IF rStop.Q OR NOT Enable OR Fault THEN
            RequestEmission := FALSE;
            OpenShutter := FALSE;
            state := PostGas;
            tonPostGas(IN := TRUE, PT := PostGasMs);
        END_IF

    PostGas:
        RequestEmission := FALSE;
        OpenShutter := FALSE;
        GasEnable := TRUE;
        tonPostGas(IN := TRUE, PT := PostGasMs);
        IF tonPostGas.Q THEN
            tonPostGas(IN := FALSE);
            GasEnable := FALSE;
            state := Idle;
            Busy := FALSE;
        END_IF

    Fault:
        RequestEmission := FALSE;
        OpenShutter := FALSE;
        GasEnable := FALSE;
        Fault := TRUE;
        Busy := FALSE;
        IF rReset.Q AND NOT FaultIn THEN
            Fault := FALSE;
            state := Idle;
        END_IF
END_CASE

END_FUNCTION_BLOCK
