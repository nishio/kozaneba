import AnnotRef.Check
def main (args : List String) : IO UInt32 := AnnotRef.Check.run (args.head?.bind String.toNat? |>.getD 3)
