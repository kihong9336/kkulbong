import subprocess

class MacVolume:
    @staticmethod
    def _run_applescript(script):
        """AppleScript 명령어를 실행하는 내부 함수"""
        cmd = f"osascript -e '{script}'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout.strip()

    @staticmethod
    def set_volume(level):
        """
        볼륨을 설정합니다 (0 ~ 100)
        예: set_volume(50)
        """
        # 입력값이 0~100 사이인지 확인
        level = max(0, min(100, int(level)))
        script = f"set volume output volume {level}"
        MacVolume._run_applescript(script)
        print(f"🔊 볼륨이 {level}%로 설정되었습니다.")

    @staticmethod
    def get_volume():
        """현재 볼륨 크기를 반환합니다 (0 ~ 100)"""
        script = "output volume of (get volume settings)"
        result = MacVolume._run_applescript(script)
        # 결과가 없을 경우 0 반환, 있을 경우 정수로 변환
        return int(result) if result else 0

    @staticmethod
    def mute():
        """음소거 (Mute)"""
        script = "set volume output muted true"
        MacVolume._run_applescript(script)
        print("🔇 음소거 되었습니다.")

    @staticmethod
    def unmute():
        """음소거 해제 (Unmute)"""
        script = "set volume output muted false"
        MacVolume._run_applescript(script)
        print("🔈 음소거가 해제되었습니다.")

def hello_world():
    print("Hello, World!")


if __name__ == "__main__":
    hello_world()
    
    # MacVolume 사용 예시
    current_vol = MacVolume.get_volume()
    print(f"현재 시스템 볼륨: {current_vol}")

    # 테스트: 볼륨을 30으로 설정 (필요시 주석 해제하여 테스트)
    # MacVolume.set_volume(30)

    # 볼륨을 50으로 설정
    MacVolume.set_volume(50)
