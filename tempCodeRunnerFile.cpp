#include <iostream>
using namespace std;

class BankAccount {
private:
    string accountNumber;
    string accountHolder;
    double balance;
//untuk memastikan apakah bankAccount Valid atau enggak
    bool isValidAccount(BankAccount &target) {
    if (target.accountNumber != "") {
            return true;
        }
        return false;
    }
//untuk memastikan dana yang ditransfer tidak melebihi balance
    bool hasSufficientFunds(double amount) {
        return balance >= amount;
    }

public:
    BankAccount(string accN, string accH, double Am) {
    accountNumber = accN;
    accountHolder = accH;
    balance = Am;
    }

    void displayBalance() {
    cout << "Account Holder : " << accountHolder << endl;
    cout << "Balance        : " << balance << endl;
    }

    void withdraw(BankAccount &target, double amount) {

        if (!isValidAccount(target)) {
        cout << "Target account tidak valid!" << endl;
            return;
        }

        if (!hasSufficientFunds(amount)) {
     cout << "Saldo tidak cukup!" << endl;
            return;
        }

        balance -= amount;
        target.balance += amount;

        cout << "Transfer berhasil sebesar " << amount << endl;
    }
};

int main() {

    BankAccount acc1("0", "Nino", 5000);
    BankAccount acc2("67890", "Noni", 2000);

    cout << "Saldo awal:" << endl;
    acc1.displayBalance();
    acc2.displayBalance();

    cout << "\nMelakukan transfer...\n" << endl;
    acc1.withdraw(acc2, 15000);

    cout << "\nSaldo setelah transfer:" << endl;
    acc1.displayBalance();
    acc2.displayBalance();

    return 0;
}