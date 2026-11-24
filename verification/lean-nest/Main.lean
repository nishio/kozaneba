import Nest.Check
def main (args : List String) : IO Unit := Nest.Check.run (args.head?.bind String.toNat? |>.getD 4)
