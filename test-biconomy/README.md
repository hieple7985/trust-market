# Biconomy Gasless UX - Quick Test

**Goal**: Verify Biconomy works with BNB Testnet before full integration  
**Time**: 3-4 hours  
**Status**: 🔴 Not Started

---

## 📋 Checklist

### Phase 1: Setup (1 hour)
- [ ] Read Biconomy documentation
- [ ] Create Biconomy account
- [ ] Get API keys (Bundler + Paymaster)
- [ ] Fund paymaster with testnet BNB

### Phase 2: Test (1-2 hours)
- [ ] Install Biconomy SDK
- [ ] Create test script
- [ ] Test gasless transaction
- [ ] Verify on BscScan

### Phase 3: Decision (30 min)
- [ ] Evaluate results
- [ ] Make go/no-go decision
- [ ] Document findings

---

## 🚀 Quick Start

### Step 1: Create Biconomy Account

1. Go to https://dashboard.biconomy.io/
2. Sign up with email or wallet
3. Verify email
4. Complete onboarding

### Step 2: Create Project

1. Click "Create New Project"
2. Project Name: `PredictAI Oracle`
3. Select Chain: **BNB Smart Chain Testnet (97)**
4. Click "Create"

### Step 3: Get API Keys

**Bundler URL:**
1. Go to "Bundler" tab
2. Copy Bundler URL for BNB Testnet
3. Save to `.env.local`:
   ```
   NEXT_PUBLIC_BICONOMY_BUNDLER_URL=https://bundler.biconomy.io/api/v2/97/...
   ```

**Paymaster URL:**
1. Go to "Paymaster" tab
2. Copy Paymaster URL for BNB Testnet
3. Save to `.env.local`:
   ```
   NEXT_PUBLIC_BICONOMY_PAYMASTER_URL=https://paymaster.biconomy.io/api/v1/97/...
   ```

### Step 4: Fund Paymaster

1. Go to "Paymaster" tab
2. Click "Fund Paymaster"
3. Get testnet BNB from faucet:
   - https://testnet.bnbchain.org/faucet-smart
4. Send 0.1 BNB to paymaster address
5. Verify balance in dashboard

### Step 5: Install Dependencies

```bash
cd hackathons/002_prediction_markets/3_dev/frontend
pnpm add @biconomy/account @biconomy/bundler @biconomy/paymaster @biconomy/core-types
```

### Step 6: Run Test

```bash
# Create .env.local with your keys
cp .env.example .env.local

# Edit .env.local with your API keys and private key

# Run test
pnpm tsx test-biconomy/test-aa.ts
```

---

## ✅ Success Criteria

**Test PASSES if:**
- ✅ Smart account created successfully
- ✅ Gasless transaction submitted
- ✅ Transaction confirmed on BscScan
- ✅ No errors in console
- ✅ Paymaster paid gas fees

**Test FAILS if:**
- ❌ API errors (invalid keys, network issues)
- ❌ Transaction reverts
- ❌ Paymaster not funded
- ❌ BNB Chain not supported

---

## 🚦 Decision Matrix

### ✅ GO (Continue with Option B)
**If:**
- Test passes successfully
- Transaction time < 10 seconds
- Clear error messages
- Good documentation

**Action:**
- Proceed with full integration
- Allocate Day 5 for Biconomy
- Update timeline

### ❌ NO-GO (Fallback to Option A)
**If:**
- Test fails repeatedly
- Poor documentation
- Complex integration
- Time > 2 hours to debug

**Action:**
- Stop Biconomy work
- Focus on screenshots & demo
- Deploy without gasless
- Add to roadmap for post-hackathon

---

## 📝 Test Results

**Date**: ___________  
**Time Spent**: ___________  
**Result**: ⬜ PASS / ⬜ FAIL

**Notes**:
- 
- 
- 

**Decision**: ⬜ GO / ⬜ NO-GO

**Next Steps**:
- 
- 
- 

---

## 🔗 Resources

- **Biconomy Docs**: https://docs.biconomy.io/
- **SDK Reference**: https://docs.biconomy.io/sdk
- **Examples**: https://github.com/bcnmy/biconomy-client-sdk
- **Dashboard**: https://dashboard.biconomy.io/
- **BNB Testnet**: https://testnet.bscscan.com/
- **Faucet**: https://testnet.bnbchain.org/faucet-smart

