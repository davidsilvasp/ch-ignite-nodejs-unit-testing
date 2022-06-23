import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get statement", () => {
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should not be able to get a statement of a non-existing user", async () => {
    const nonExistingUserId = "39f0128a-dbcc-476d-83ee-67f67ae44111";

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

    const response = getStatementOperationUseCase.execute({
      user_id: nonExistingUserId,
      statement_id: statement.id,
    });

    await expect(response).rejects.toEqual(
      new GetStatementOperationError.UserNotFound()
    );
  });

  it("should not be able to get a non-existing statement", async () => {
    const nonExistingStatementId = "39f0128a-dbcc-476d-83ee-67f67ae44111";

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

    const response = getStatementOperationUseCase.execute({
      user_id: authenticatedUser.user.id,
      statement_id: nonExistingStatementId,
    });

    await expect(response).rejects.toEqual(
      new GetStatementOperationError.StatementNotFound()
    );
  });

  it("should be able to get a statement", async () => {
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

    const response = await getStatementOperationUseCase.execute({
      user_id: authenticatedUser.user.id,
      statement_id: statement.id,
    });

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("user_id");
  });
});
