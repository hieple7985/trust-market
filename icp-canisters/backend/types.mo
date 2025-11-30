import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

module {
  public type MarketStatus = {
    #Pending;
    #Proposed;
    #Finalized;
  };

  public type Market = {
    id : Text;
    status : MarketStatus;
    resolutionTime : Int;
    creator : Principal;
    question : Text;
    totalNo : Nat;
    description : Text;
    reasoning : ?Text;
    totalYes : Nat;
    outcome : ?Bool;
  };

  public type Position = {
    marketId : Text;
    user : Principal;
    isYes : Bool;
    amount : Nat;
  };
}
