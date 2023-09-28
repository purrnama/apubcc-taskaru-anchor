import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";
import { TaskaruSolang } from "../target/types/taskaru_solang";

function randomPointsGenerator(min = 1, max = 100) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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

  it("Test 1 - Initializes a new account!", async () => {
    const tx = await program.methods
      .new(walletSeed, [bump], dataAccount)
      .accounts({ dataAccount })
      .rpc();
    const score = await program.methods
      .getCurrentScore()
      .accounts({ dataAccount })
      .view();
    expect(score.toNumber()).to.equal(0);
  });

  it("Test 2 - Adds points!", async () => {
    const pointsToAdd = randomPointsGenerator();
    await program.methods
      .addPoints(pointsToAdd)
      .accounts({ dataAccount })
      .rpc();
    const score = await program.methods
      .getCurrentScore()
      .accounts({ dataAccount })
      .view();
    expect(score.toNumber()).to.equal(pointsToAdd);
  });

  it("Test 3 - Resets and checks high score!", async () => {
    const initialScore = (
      await program.methods.getCurrentScore().accounts({ dataAccount }).view()
    ).toNumber();
    const pointsToAdd = randomPointsGenerator();
    await program.methods
      .addPoints(pointsToAdd)
      .accounts({ dataAccount })
      .rpc();
    await program.methods.resetScore().accounts({ dataAccount }).rpc();
    const updatedScore = await program.methods
      .getCurrentScore()
      .accounts({ dataAccount })
      .view();
    expect(updatedScore.toNumber()).to.equal(0);
    const highScore = await program.methods
      .getHighestScore()
      .accounts({ dataAccount })
      .view();
    expect(highScore.toNumber()).to.equal(initialScore + pointsToAdd);
  });
});
