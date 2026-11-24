import Nest.Check
def main (args : List String) : IO UInt32 := Nest.Check.run (args.head?.bind String.toNat? |>.getD 4)
