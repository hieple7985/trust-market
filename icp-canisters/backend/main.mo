import Types "types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Bool "mo:base/Bool";

persistent actor {
  type Market = Types.Market;
  type Position = Types.Position;
  type MarketStatus = Types.MarketStatus;

  private stable var nextId : Nat = 0;
  private transient var markets = HashMap.HashMap<Text, Market>(10, Text.equal, Text.hash);
  private transient var positions = HashMap.HashMap<Text, Position>(10, Text.equal, Text.hash);

  public shared ({ caller }) func createMarket(
    question : Text,
    description : Text,
    resolutionTime : Int,
  ) : async Text {
    let id = Nat.toText(nextId);
    nextId += 1;

    let market : Market = {
      id = id;
      status = #Pending;
      resolutionTime = resolutionTime;
      creator = caller;
      question = question;
      totalNo = 0;
      description = description;
      reasoning = null;
      totalYes = 0;
      outcome = null;
    };

    markets.put(id, market);
    id
  };

  public shared ({ caller }) func placeBet(
    marketId : Text,
    isYes : Bool,
    amount : Nat,
  ) : async Bool {
    switch (markets.get(marketId)) {
      case (null) { false };
      case (?m) {
        let updated : Market = if (isYes) {
          {
            id = m.id;
            status = m.status;
            resolutionTime = m.resolutionTime;
            creator = m.creator;
            question = m.question;
            totalNo = m.totalNo;
            description = m.description;
            reasoning = m.reasoning;
            totalYes = m.totalYes + amount;
            outcome = m.outcome;
          }
        } else {
          {
            id = m.id;
            status = m.status;
            resolutionTime = m.resolutionTime;
            creator = m.creator;
            question = m.question;
            totalNo = m.totalNo + amount;
            description = m.description;
            reasoning = m.reasoning;
            totalYes = m.totalYes;
            outcome = m.outcome;
          }
        };

        markets.put(marketId, updated);

        let positionId = marketId # "-" # Principal.toText(caller) # "-" # Nat.toText(nextId);
        let position : Position = {
          marketId = marketId;
          user = caller;
          isYes = isYes;
          amount = amount;
        };
        positions.put(positionId, position);
        true
      };
    };
  };

  public query func getAllMarkets() : async [Market] {
    Iter.toArray(markets.vals());
  };

  public query func getMarket(id : Text) : async ?Market {
    markets.get(id);
  };

  public query func getUserPositions(user : Principal) : async [Position] {
    let all = markets.keys();
    let result = Iter.filter<Position>(
      positions.vals(),
      func (p : Position) : Bool { p.user == user },
    );
    Iter.toArray(result);
  };

  public shared ({ caller }) func proposeResolution(
    marketId : Text,
    outcome : Bool,
    reasoning : Text,
  ) : async Bool {
    switch (markets.get(marketId)) {
      case (null) { false };
      case (?m) {
        let updated : Market = {
          id = m.id;
          status = #Proposed;
          resolutionTime = m.resolutionTime;
          creator = m.creator;
          question = m.question;
          totalNo = m.totalNo;
          description = m.description;
          reasoning = ?reasoning;
          totalYes = m.totalYes;
          outcome = ?outcome;
        };
        markets.put(marketId, updated);
        true
      };
    };
  };

  public shared ({ caller }) func finalizeMarket(marketId : Text) : async Bool {
    switch (markets.get(marketId)) {
      case (null) { false };
      case (?m) {
        let updated : Market = {
          id = m.id;
          status = #Finalized;
          resolutionTime = m.resolutionTime;
          creator = m.creator;
          question = m.question;
          totalNo = m.totalNo;
          description = m.description;
          reasoning = m.reasoning;
          totalYes = m.totalYes;
          outcome = m.outcome;
        };
        markets.put(marketId, updated);
        true
      };
    };
  };
}
