import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should not be able to create a statement to a non-existing user", async () => {
    const nonExistingUserId = "39f0128a-dbcc-476d-83ee-67f67ae44111";

    const statement = createStatementUseCase.execute({
      user_id: nonExistingUserId,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit test",
    });

    await expect(statement).rejects.toEqual(
      new CreateStatementError.UserNotFound()
    );
  });

  it("should be able to create a deposit type statement", async () => {
    const user = {
      name: "David",
      email: "david@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const statement = await createStatementUseCase.execute({
      user_id: authenticatedUser.user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit test",
    });

    expect(statement.amount).toBe(500);
  });

  it("should be able to create a withdrawal type statement", async () => {
    const user = {
      name: "David",
      email: "david@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    await createStatementUseCase.execute({
      user_id: authenticatedUser.user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit test",
    });

    const statement = await createStatementUseCase.execute({
      user_id: authenticatedUser.user.id,
      type: OperationType.WITHDRAW,
      amount: 500,
      description: "Withdraw test",
    });

    expect(statement.amount).toBe(500);
  });

  it("should not be able to create a withdrawal type statement when the balance is insufficient", async () => {
    const user = {
      name: "David",
      email: "david@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    await createStatementUseCase.execute({
      user_id: authenticatedUser.user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit test",
    });

    const statement = createStatementUseCase.execute({
      user_id: authenticatedUser.user.id,
      type: OperationType.WITHDRAW,
      amount: 501,
      description: "Withdraw test",
    });

    await expect(statement).rejects.toEqual(
      new CreateStatementError.InsufficientFunds()
    );
  });
});
