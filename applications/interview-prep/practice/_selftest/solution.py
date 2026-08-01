import sys


def main() -> None:
    nums = list(map(int, sys.stdin.read().split()))
    print(nums[0] + nums[1])


if __name__ == "__main__":
    main()
