import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";
import { TaskaruSolang } from "../target/types/taskaru_solang";

describe("taskaru-solang", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TaskaruSolang as Program<TaskaruSolang>;
  const wallet = provider.wallet;
  const walletSeed = wallet.publicKey.toBuffer();
  const [dataAccount, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("seed"), walletSeed],
    program.programId
  );

  const keypair = anchor.web3.Keypair.generate();
  const seed = keypair.publicKey.toBuffer();
  const [dataAccount2, bump2] = PublicKey.findProgramAddressSync(
    [Buffer.from("seed"), seed],
    program.programId
  );

  it("Initializes a new account!", async () => {
    const tx = await program.methods
      .new(walletSeed, [bump], dataAccount)
      .accounts({ dataAccount: dataAccount })
      .rpc();
    const value = await program.methods
      .getTasksCompleted()
      .accounts({ dataAccount: dataAccount })
      .view();
    expect(value.toNumber()).to.equal(0);
  });
  it("User accepts task!", async () => {
    await program.methods
      .setIsAcceptedTask(true)
      .accounts({ dataAccount: dataAccount })
      .rpc();
    const result = await program.methods
      .getIsAcceptedTask()
      .accounts({ dataAccount: dataAccount })
      .view();
    expect(result).to.equal(true);
  });
  it("User forfeits task!", async () => {
    await program.methods
      .setIsAcceptedTask(false)
      .accounts({ dataAccount: dataAccount })
      .rpc();
    const result = await program.methods
      .getIsAcceptedTask()
      .accounts({ dataAccount: dataAccount })
      .view();
    expect(result).to.equal(false);
  });

  it("Initializes another account!", async () => {
    const tx = await program.methods
      .new(seed, [bump2], dataAccount2)
      .accounts({ dataAccount: dataAccount2 })
      .rpc();
    const value = await program.methods
      .getTasksCompleted()
      .accounts({ dataAccount: dataAccount2 })
      .view();
    expect(value.toNumber()).to.equal(0);
  });
  it("Second user accepts task!", async () => {
    await program.methods
      .setIsAcceptedTask(true)
      .accounts({ dataAccount: dataAccount2 })
      .rpc();
    const result = await program.methods
      .getIsAcceptedTask()
      .accounts({ dataAccount: dataAccount2 })
      .view();
    expect(result).to.equal(true);
  });
  it("isAcceptedTask values are unique!", async () => {
    const value1 = await program.methods
      .getIsAcceptedTask()
      .accounts({ dataAccount: dataAccount })
      .view();
    const value2 = await program.methods
      .getIsAcceptedTask()
      .accounts({ dataAccount: dataAccount2 })
      .view();
    expect(value1 == value2).to.equal(false);
  });
  it("Second user submits a solution!", async () => {
    const tx = await program.methods
      .submitSolution()
      .accounts({ dataAccount: dataAccount2 })
      .rpc();
    const result = await program.methods
      .getIsSubmittedSolution()
      .accounts({ dataAccount: dataAccount2 })
      .view();
    expect(result).to.equal(true);
  });
  it("User gets task status!", async () => {
    const value = await program.methods
      .getTaskStatus()
      .accounts({ dataAccount: dataAccount })
      .view();
    console.log(value);
  });
  it("Second user gets task status!", async () => {
    const value = await program.methods
      .getTaskStatus()
      .accounts({ dataAccount: dataAccount2 })
      .view();
    console.log(value);
  });
  it("User resets all data!!? Das crazy", async () => {
    const tx = await program.methods
      .resetAll()
      .accounts({ dataAccount: dataAccount })
      .rpc();
    const completedTasks = await program.methods
      .getTasksCompleted()
      .accounts({ dataAccount: dataAccount })
      .view();
    const isAcceptedTask = await program.methods
      .getIsAcceptedTask()
      .accounts({ dataAccount: dataAccount })
      .view();
    const isSubmittedSolution = await program.methods
      .getIsSubmittedSolution()
      .accounts({ dataAccount: dataAccount })
      .view();
    expect(completedTasks.toNumber()).to.equal(0);
    expect(isAcceptedTask).to.equal(false);
    expect(isSubmittedSolution).to.equal(false);
  });
});
