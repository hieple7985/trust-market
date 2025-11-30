export const idlFactory = ({ IDL }: any) => {
  const MarketStatus = IDL.Variant({
    'Pending' : IDL.Null,
    'Proposed' : IDL.Null,
    'Finalized' : IDL.Null,
  });
  const Market = IDL.Record({
    'id' : IDL.Text,
    'status' : MarketStatus,
    'resolutionTime' : IDL.Int,
    'creator' : IDL.Principal,
    'question' : IDL.Text,
    'totalNo' : IDL.Nat,
    'description' : IDL.Text,
    'reasoning' : IDL.Opt(IDL.Text),
    'totalYes' : IDL.Nat,
    'outcome' : IDL.Opt(IDL.Bool),
  });
  const Position = IDL.Record({
    'marketId' : IDL.Text,
    'user' : IDL.Principal,
    'isYes' : IDL.Bool,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'createMarket' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Int],
        [IDL.Text],
        [],
      ),
    'finalizeMarket' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getAllMarkets' : IDL.Func([], [IDL.Vec(Market)], ['query']),
    'getMarket' : IDL.Func([IDL.Text], [IDL.Opt(Market)], ['query']),
    'getUserPositions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Position)],
        ['query'],
      ),
    'placeBet' : IDL.Func([IDL.Text, IDL.Bool, IDL.Nat], [IDL.Bool], []),
    'proposeResolution' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Text],
        [IDL.Bool],
        [],
      ),
  });
};
