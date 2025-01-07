import tkinter as tk
from tkinter import ttk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.animation import FuncAnimation
import numpy as np

class DivisionVisualizer:
    def __init__(self, root):
        self.root = root
        self.root.title("분수 나눗셈 시각화")
        
        # 입력 프레임
        input_frame = ttk.Frame(root, padding="10")
        input_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 입력 필드
        ttk.Label(input_frame, text="자연수(a):").grid(row=0, column=0, padx=5, pady=5)
        self.a_entry = ttk.Entry(input_frame, width=10)
        self.a_entry.grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Label(input_frame, text="단위분수 분모(b):").grid(row=1, column=0, padx=5, pady=5)
        self.b_entry = ttk.Entry(input_frame, width=10)
        self.b_entry.grid(row=1, column=1, padx=5, pady=5)
        
        # 시작 버튼
        ttk.Button(input_frame, text="시각화 시작", command=self.start_visualization).grid(row=2, column=0, columnspan=2, pady=10)
        
        # 결과 텍스트
        self.result_label = ttk.Label(input_frame, text="", wraplength=300)
        self.result_label.grid(row=3, column=0, columnspan=2, pady=10)
        
        # matplotlib 그래프를 위한 프레임
        self.fig, self.ax = plt.subplots(figsize=(8, 6))
        self.canvas = FigureCanvasTkAgg(self.fig, master=root)
        self.canvas.get_tk_widget().grid(row=1, column=0, padx=10, pady=10)

    def draw_circle(self, center_x, center_y, radius=0.4):
        circle = plt.Circle((center_x, center_y), radius, fill=False)
        self.ax.add_artist(circle)
        return circle

    def animate(self, frame, total_circles, divisions):
        self.ax.clear()
        self.ax.set_xlim(-2, 8)
        self.ax.set_ylim(-2, 2)
        self.ax.axis('equal')
        self.ax.axis('off')
        
        # 원본 원들 그리기
        for i in range(total_circles):
            self.draw_circle(i, 0)
            
        # 분할된 원들 그리기 (애니메이션 효과)
        if frame > 0:
            for i in range(total_circles):
                for j in range(divisions):
                    angle = 2 * np.pi * j / divisions
                    self.ax.plot([i, i + 0.4 * np.cos(angle)],
                               [0, 0.4 * np.sin(angle)], 'b-')

    def start_visualization(self):
        try:
            a = int(self.a_entry.get())
            b = int(self.b_entry.get())
            
            if a <= 0 or b <= 0:
                self.result_label.config(text="양의 정수를 입력해주세요!")
                return
                
            question = f"케익 {a}개를 케익 1/{b}개씩 사람들에게 나눠주면 몇 명에게 나눠줄 수 있을까요?"
            answer = f"\n\n답: {a}÷(1/{b}) = {a}×{b} = {a*b}명에게 나눠줄 수 있습니다!"
            self.result_label.config(text=question + answer)
            
            # 애니메이션 생성
            self.ax.clear()
            anim = FuncAnimation(self.fig, self.animate, frames=2,
                               fargs=(a, b),
                               interval=1000, repeat=False)
            self.canvas.draw()
            
        except ValueError:
            self.result_label.config(text="올바른 숫자를 입력해주세요!")

def main():
    root = tk.Tk()
    app = DivisionVisualizer(root)
    root.mainloop()

if __name__ == "__main__":
    main()
